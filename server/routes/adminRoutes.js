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

    res.json({
      usersCount,
      listingsCount,
      activeListingsCount,
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
   DELETE LISTING
========================================================= */

router.delete(
  "/listings/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const listingId = Number(req.params.id);

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

/* =========================================================
   COOK OF THE MONTH
========================================================= */

router.get(
  "/cook-of-the-month",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const requests = await prisma.mealRequest.findMany({
        where: {
          status: "PICKED_UP",
          rating: {
            not: null,
          },
          ratedAt: {
            gte: startOfMonth,
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
        },
      });

      if (requests.length === 0) {
        return res.json({
          cook: null,
          message: "No ratings available for this month",
        });
      }

      const stats = {};

      for (const request of requests) {
        const providerId = request.providerId;

        if (!stats[providerId]) {
          stats[providerId] = {
            provider: request.provider,
            totalRating: 0,
            ratingsCount: 0,
          };
        }

        stats[providerId].totalRating += request.rating;
        stats[providerId].ratingsCount += 1;
      }

      const cooks = Object.values(stats).map((item) => ({
        provider: item.provider,
        ratingsCount: item.ratingsCount,
        averageRating: Number(
          (item.totalRating / item.ratingsCount).toFixed(2)
        ),
      }));

      cooks.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }

        return b.ratingsCount - a.ratingsCount;
      });

      res.json({
        cook: cooks[0],
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