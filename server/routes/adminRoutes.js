const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

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
router.delete("/listings/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
   
    console.log("DELETE ROUTE HIT");
    console.log(req.params.id);
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
});
router.patch("/users/:id/ban", authMiddleware, adminMiddleware, async (req, res) => {
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
});

router.patch("/users/:id/unban", authMiddleware, adminMiddleware, async (req, res) => {
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
});

module.exports = router;