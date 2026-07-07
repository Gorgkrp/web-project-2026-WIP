const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, portions, pickupLocation, pickupTime } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        portions: Number(portions),
        pickupLocation,
        pickupTime,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "Listing created",
      listing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        portions: {
          gt: 0,
        },
        OR: [
          {
            expiresAt: {
              gt: new Date(),
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
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listingId = Number(req.params.id);
    const { title, description, portions, pickupLocation, pickupTime } = req.body;

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

    if (listing.userId !== req.user.userId && req.user.role !== "ADMIN") {
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
    res.status(500).json({ message: "Server error" });
  }
});

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

    if (listing.expiresAt && listing.expiresAt <= new Date()) {
      return res.status(400).json({
        message: "This listing has expired",
      });
    }

    if (listing.portions <= 0) {
      return res.status(400).json({
        message: "No portions available",
      });
    }

    const existingRequest = await prisma.mealRequest.findFirst({
      where: {
        listingId,
        requesterId: req.user.userId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this listing",
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
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/requests/provider", authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.mealRequest.findMany({
      where: {
        providerId: req.user.userId,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
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
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/requests/my", authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.mealRequest.findMany({
      where: {
        requesterId: req.user.userId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
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

    res.json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/requests/:id/approve", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        listing: true,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.providerId !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending requests can be approved",
      });
    }

    if (request.listing.portions <= 0) {
      return res.status(400).json({
        message: "No portions available",
      });
    }

    await prisma.mealRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "APPROVED",
      },
    });

    await prisma.listing.update({
      where: {
        id: request.listingId,
      },
      data: {
        portions: {
          decrement: 1,
        },
      },
    });

    res.json({
      message: "Request approved",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/requests/:id/reject", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.providerId !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending requests can be rejected",
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
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/requests/:id/picked-up", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.providerId !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({
        message: "Only approved requests can be marked as picked up",
      });
    }

    await prisma.mealRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "PICKED_UP",
      },
    });

    res.json({
      message: "Request marked as picked up",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/requests/:id/no-show", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.providerId !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({
        message: "Only approved requests can be marked as no-show",
      });
    }

    await prisma.mealRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "NO_SHOW",
      },
    });

    await prisma.user.update({
      where: {
        id: request.requesterId,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    res.json({
      message: "Request marked as no-show. Requester lost 1 credit.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/requests/:id/rate", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { rating } = req.body;

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.requesterId !== req.user.userId) {
      return res.status(403).json({
        message: "Only the requester can rate this meal",
      });
    }

    if (request.status !== "PICKED_UP") {
      return res.status(400).json({
        message: "Only picked up meals can be rated",
      });
    }

    if (request.rating !== null) {
      return res.status(400).json({
        message: "This meal has already been rated",
      });
    }

    const providerCreditReward = numericRating > 3 ? 2 : 1;

    const updatedRequest = await prisma.mealRequest.update({
      where: {
        id: requestId,
      },
      data: {
        rating: numericRating,
        ratedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: {
        id: request.providerId,
      },
      data: {
        credits: {
          increment: providerCreditReward,
        },
      },
    });

    res.json({
      message: `Meal rated successfully. Provider earned ${providerCreditReward} credits.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.patch("/requests/:id/rate", authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { rating } = req.body;

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const request = await prisma.mealRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.requesterId !== req.user.userId) {
      return res.status(403).json({
        message: "Only the requester can rate this meal",
      });
    }

    if (request.status !== "PICKED_UP") {
      return res.status(400).json({
        message: "Only picked up meals can be rated",
      });
    }

    if (request.rating !== null && request.rating !== undefined) {
      return res.status(400).json({
        message: "This meal has already been rated",
      });
    }

    const providerCreditReward = numericRating > 3 ? 2 : 1;

    const updatedRequest = await prisma.mealRequest.update({
      where: {
        id: requestId,
      },
      data: {
        rating: numericRating,
        ratedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: {
        id: request.providerId,
      },
      data: {
        credits: {
          increment: providerCreditReward,
        },
      },
    });

    res.json({
      message: `Meal rated successfully. Provider earned ${providerCreditReward} credits.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
