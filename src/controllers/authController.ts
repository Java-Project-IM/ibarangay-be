import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../types";

const generateToken = (id: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET || "default_secret";
  const jwtExpire = process.env.JWT_EXPIRE || "7d";

  // Cast to any to satisfy overloaded typings of jsonwebtoken sign
  return jwt.sign(
    { id, role } as any,
    jwtSecret as any,
    { expiresIn: jwtExpire } as any
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, address, phoneNumber } =
      req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      address,
      phoneNumber,
      role: "resident",
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          address: user.address,
          phoneNumber: user.phoneNumber,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          address: user.address,
          phoneNumber: user.phoneNumber,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, address, phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { firstName, lastName, address, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
