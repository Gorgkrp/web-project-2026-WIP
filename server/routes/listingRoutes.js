const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const applyExpiredReviewPenalties = async (userId) => {
  const now = new Date();

  const overdueReviews = await prisma.mealRequest.findMany({
    where: {
      requesterId: userId,
      status: "PICKED_UP",
      rating: null,
      reviewDeadline: {
        lt: now,
      },
      reviewPenaltyApplied: false,
    },
    select: {
      id: true,
    },
  });

  if (overdueReviews.length === 0) {
    return 0;
  }

  const requestIds = overdueReviews.map((request) => request.id);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          decrement: overdueReviews.length,
        },
      },
    }),

    prisma.mealRequest.updateMany({
      where: {
        id: {
          in: requestIds,
        },
        reviewPenaltyApplied: false,
      },
      data: {
        reviewPenaltyApplied: true,
      },
    }),
  ]);

  return overdueReviews.length;
};

/* =========================================================
   CREATE LISTING
========================================================= */

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        portions,
        pickupLocation,
        pickupTime,
        allergens,
      } = req.body;

      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          portions: Number(portions),
          pickupLocation,
          pickupTime,
          allergens: allergens || null,
          imageUrl,
          expiresAt: new Date(
            Date.now() + 48 * 60 * 60 * 1000
          ),
          userId: req.user.userId,
        },
      });

      res.status(201).json({
        message: "Listing created",
        listing,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   GET ACTIVE LISTINGS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const now = new Date();

    await prisma.listing.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "INACTIVE",
      },
    });

    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        portions: {
          gt: 0,
        },
        OR: [
          {
            expiresAt: {
              gt: now,
            },
          },
          {
            expiresAt: null,
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            credits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(listings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   EDIT LISTING
========================================================= */

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    const {
      title,
      description,
      portions,
      pickupLocation,
      pickupTime,
    } = req.body;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (
      listing.userId !== req.user.userId &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "You are not allowed to edit this listing",
      });
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        title,
        description,
        portions: Number(portions),
        pickupLocation,
        pickupTime,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Listing updated",
      listing: updatedListing,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   REQUEST PORTION
========================================================= */

router.post("/:id/request", authMiddleware, async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.userId === req.user.userId) {
      return res.status(400).json({
        message: "You cannot request your own listing",
      });
    }

    if (listing.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This listing is not active",
      });
    }

    if (
      listing.expiresAt &&
      listing.expiresAt <= new Date()
    ) {
      return res.status(400).json({
        message: "This listing has expired",
      });
    }

    if (listing.portions <= 0) {
      return res.status(400).json({
        message: "No portions available",
      });
    }

    const requester = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
    });

    if (!requester || requester.credits < 1) {
      return res.status(400).json({
        message: "You need at least 1 point to request a meal",
      });
    }

    const existingRequest =
      await prisma.mealRequest.findFirst({
        where: {
          listingId,
          requesterId: req.user.userId,
          status: "PENDING",
        },
      });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "You already have a pending request for this listing",
      });
    }

    const request = await prisma.mealRequest.create({
      data: {
        listingId,
        requesterId: req.user.userId,
        providerId: listing.userId,
      },
    });

    res.status(201).json({
      message: "Request sent",
      request,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   PROVIDER REQUESTS
========================================================= */

router.get(
  "/requests/provider",
  authMiddleware,
  async (req, res) => {
    try {
      const requests =
        await prisma.mealRequest.findMany({
          where: {
            providerId: req.user.userId,
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
                credits: true,
              },
            },
            listing: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json(requests);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   MY REQUESTS
========================================================= */

router.get(
  "/requests/my",
  authMiddleware,
  async (req, res) => {
    try {
      const penaltiesApplied =
        await applyExpiredReviewPenalties(
          req.user.userId
        );

      const requests =
        await prisma.mealRequest.findMany({
          where: {
            requesterId: req.user.userId,
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        requests,
        penaltiesApplied,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   APPROVE REQUEST
========================================================= */

router.patch(
  "/requests/:id/approve",
  authMiddleware,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      const request =
        await prisma.mealRequest.findUnique({
          where: {
            id: requestId,
          },
          include: {
            listing: true,
            requester: true,
          },
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.providerId !==
        req.user.userId
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      if (request.status !== "PENDING") {
        return res.status(400).json({
          message:
            "Only pending requests can be approved",
        });
      }

      if (
        request.listing.status !== "ACTIVE"
      ) {
        return res.status(400).json({
          message: "Listing is not active",
        });
      }

      if (
        request.listing.expiresAt &&
        request.listing.expiresAt <= new Date()
      ) {
        return res.status(400).json({
          message: "Listing has expired",
        });
      }

      if (request.listing.portions <= 0) {
        return res.status(400).json({
          message: "No portions available",
        });
      }

      if (request.requester.credits < 1) {
        return res.status(400).json({
          message:
            "Requester does not have enough points",
        });
      }

      await prisma.$transaction([
        prisma.mealRequest.update({
          where: {
            id: requestId,
          },
          data: {
            status: "APPROVED",
          },
        }),

        prisma.listing.update({
          where: {
            id: request.listingId,
          },
          data: {
            portions: {
              decrement: 1,
            },
          },
        }),

        prisma.user.update({
          where: {
            id: request.requesterId,
          },
          data: {
            credits: {
              decrement: 1,
            },
          },
        }),
      ]);

      res.json({
        message:
          "Request approved. Requester spent 1 point.",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   REJECT REQUEST
========================================================= */

router.patch(
  "/requests/:id/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      const request =
        await prisma.mealRequest.findUnique({
          where: {
            id: requestId,
          },
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.providerId !==
        req.user.userId
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      if (request.status !== "PENDING") {
        return res.status(400).json({
          message:
            "Only pending requests can be rejected",
        });
      }

      await prisma.mealRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "REJECTED",
        },
      });

      res.json({
        message: "Request rejected",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   MARK AS PICKED UP
========================================================= */

router.patch(
  "/requests/:id/picked-up",
  authMiddleware,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      const request =
        await prisma.mealRequest.findUnique({
          where: {
            id: requestId,
          },
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.providerId !==
        req.user.userId
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      if (request.status !== "APPROVED") {
        return res.status(400).json({
          message:
            "Only approved requests can be marked as picked up",
        });
      }

      const now = new Date();

      const reviewDeadline = new Date(
        now.getTime() +
          48 * 60 * 60 * 1000
      );

      await prisma.mealRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "PICKED_UP",
          pickedUpAt: now,
          reviewDeadline,
          reviewPenaltyApplied: false,
        },
      });

      res.json({
        message:
          "Meal marked as picked up. The requester has 48 hours to leave a review.",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   NO SHOW
========================================================= */

router.patch(
  "/requests/:id/no-show",
  authMiddleware,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      const request =
        await prisma.mealRequest.findUnique({
          where: {
            id: requestId,
          },
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.providerId !==
        req.user.userId
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      if (request.status !== "APPROVED") {
        return res.status(400).json({
          message:
            "Only approved requests can be marked as no-show",
        });
      }

      await prisma.$transaction([
        prisma.mealRequest.update({
          where: {
            id: requestId,
          },
          data: {
            status: "NO_SHOW",
          },
        }),

        prisma.user.update({
          where: {
            id: request.requesterId,
          },
          data: {
            credits: {
              decrement: 1,
            },
          },
        }),
      ]);

      res.json({
        message:
          "Request marked as no-show. Requester lost 1 additional point.",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* =========================================================
   RATE MEAL
========================================================= */

router.patch(
  "/requests/:id/rate",
  authMiddleware,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      const numericRating = Number(
        req.body.rating
      );

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5",
        });
      }

      const request =
        await prisma.mealRequest.findUnique({
          where: {
            id: requestId,
          },
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.requesterId !==
        req.user.userId
      ) {
        return res.status(403).json({
          message:
            "Only the requester can rate this meal",
        });
      }

      if (request.status !== "PICKED_UP") {
        return res.status(400).json({
          message:
            "Only picked up meals can be rated",
        });
      }

      if (
        request.rating !== null &&
        request.rating !== undefined
      ) {
        return res.status(400).json({
          message:
            "This meal has already been rated",
        });
      }

      const now = new Date();

      if (
        request.reviewDeadline &&
        now > request.reviewDeadline
      ) {
        if (!request.reviewPenaltyApplied) {
          await prisma.$transaction([
            prisma.user.update({
              where: {
                id: request.requesterId,
              },
              data: {
                credits: {
                  decrement: 1,
                },
              },
            }),

            prisma.mealRequest.update({
              where: {
                id: requestId,
              },
              data: {
                reviewPenaltyApplied: true,
              },
            }),
          ]);
        }

        return res.status(400).json({
          message:
            "The 48-hour review period has expired. 1 additional point was deducted.",
        });
      }

      let providerCreditReward = 1;

      if (numericRating === 4) {
        providerCreditReward = 2;
      }

      if (numericRating === 5) {
        providerCreditReward = 3;
      }

      const results = await prisma.$transaction([
        prisma.mealRequest.update({
          where: {
            id: requestId,
          },
          data: {
            rating: numericRating,
            ratedAt: now,
          },
        }),

        prisma.user.update({
          where: {
            id: request.providerId,
          },
          data: {
            credits: {
              increment:
                providerCreditReward,
            },
          },
        }),

        prisma.user.update({
          where: {
            id: request.requesterId,
          },
          data: {
            credits: {
              increment: 1,
            },
          },
        }),
      ]);

      res.json({
        message: `Meal rated successfully. Provider earned ${providerCreditReward} point${
          providerCreditReward === 1
            ? ""
            : "s"
        }, and your 1 reservation point was returned.`,
        request: results[0],
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;