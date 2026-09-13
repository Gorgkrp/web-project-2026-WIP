const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* =========================================================
   ADMIN STATS
========================================================= */

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    const listingsCount = await prisma.listing.count();

    const activeListingsCount = await prisma.listing.count({
      where: {
        status: "ACTIVE",
      },
    });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const mealsSharedLastMonth = await prisma.mealRequest.count({
      where: {
        status: "PICKED_UP",
        pickedUpAt: {
          gte: oneMonthAgo,
        },
      },
    });

    res.json({
      usersCount,
      listingsCount,
      activeListingsCount,
      mealsSharedLastMonth,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   GET USERS
========================================================= */

router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   GET LISTINGS
========================================================= */

router.get("/listings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
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

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   LEADERBOARD
========================================================= */

router.get("/leaderboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const completedRequests = await prisma.mealRequest.findMany({
      where: {
        status: "PICKED_UP",
        pickedUpAt: {
          gte: oneMonthAgo,
        },
      },
      select: {
        providerId: true,
        rating: true,

        provider: {
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
            imageUrl: true,
          },
        },
      },
    });

    const donorStats = {};

    for (const request of completedRequests) {
      const providerId = request.providerId;

      if (!donorStats[providerId]) {
        donorStats[providerId] = {
          provider: request.provider,
          mealsShared: 0,
          ratingTotal: 0,
          ratingsCount: 0,
        };
      }

      donorStats[providerId].mealsShared += 1;

      if (request.rating !== null) {
        donorStats[providerId].ratingTotal += request.rating;
        donorStats[providerId].ratingsCount += 1;
      }
    }

    const donors = Object.values(donorStats).map((item) => ({
      provider: item.provider,
      mealsShared: item.mealsShared,

      averageRating:
        item.ratingsCount > 0
          ? Number(
              (
                item.ratingTotal / item.ratingsCount
              ).toFixed(2)
            )
          : null,

      ratingsCount: item.ratingsCount,
    }));

    donors.sort((a, b) => {
      if (b.mealsShared !== a.mealsShared) {
        return b.mealsShared - a.mealsShared;
      }

      return (
        (b.averageRating || 0) -
        (a.averageRating || 0)
      );
    });

    const topDonor = donors.length > 0 ? donors[0] : null;

    const mealStats = {};

    for (const request of completedRequests) {
      if (request.rating === null) {
        continue;
      }

      const listingId = request.listing.id;

      if (!mealStats[listingId]) {
        mealStats[listingId] = {
          listing: request.listing,
          provider: request.provider,
          totalRating: 0,
          ratingsCount: 0,
        };
      }

      mealStats[listingId].totalRating += request.rating;
      mealStats[listingId].ratingsCount += 1;
    }

    const topRatedMeals = Object.values(mealStats)
      .map((item) => ({
        listing: item.listing,
        provider: item.provider,
        ratingsCount: item.ratingsCount,
        averageRating: Number(
          (
            item.totalRating /
            item.ratingsCount
          ).toFixed(2)
        ),
      }))
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }

        return b.ratingsCount - a.ratingsCount;
      })
      .slice(0, 5);

    res.json({
      topDonor,
      topRatedMeals,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   DELETE LISTING
========================================================= */

router.delete(
  "/listings/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const listingId = Number(req.params.id);

      const existingRequests =
        await prisma.mealRequest.count({
          where: {
            listingId,
          },
        });

      if (existingRequests > 0) {
        await prisma.mealRequest.deleteMany({
          where: {
            listingId,
          },
        });
      }

      await prisma.listing.delete({
        where: {
          id: listingId,
        },
      });

      res.json({
        message: "Listing deleted",
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
   BAN USER
========================================================= */

router.patch(
  "/users/:id/ban",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.role === "ADMIN") {
        return res.status(400).json({
          message: "Admin users cannot be banned",
        });
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isBanned: true,
        },
      });

      res.json({
        message: "User banned",
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
   UNBAN USER
========================================================= */

router.patch(
  "/users/:id/unban",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isBanned: false,
        },
      });

      res.json({
        message: "User unbanned",
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