import User from "../models/user.model.js"


export const getCurrentUser = async(req ,res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if(!user){
        return res.status(400).json({
        message: "User not found"
      })
    }
    return res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      message: "Failed to load currentUser user"
    })
  }
}

export const updateAdmin = async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    if (!adminEmail) {
      return res.status(400).json({ success: false, message: "Admin not found" });
    }

    let admin = await User.findOne({ email: adminEmail, role: "admin" });
    
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        role: "admin",
        firstName: req.body.name || "Admin",
        phone: req.body.phone || ""
      });
    } else {
      if (req.body.name) admin.firstName = req.body.name;
      if (req.body.phone) admin.phone = req.body.phone;
      
      if (req.body.currentPassword && req.body.newPassword) {
        const isMatch = await admin.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }
        admin.password = req.body.newPassword;
      }
      
      await admin.save();
    }

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        name: admin.firstName,
        email: admin.email,
        phone: admin.phone
      }
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ success: false, message: "Failed to update admin" });
  }
};

export const getAdmin = async (req , res) => {
  try {
    const adminEmail = req.adminEmail;
    if(!adminEmail){
      return res.status(400).json({
        message: "Admin not found"
      })
    }
    
    const admin = await User.findOne({ email: adminEmail, role: "admin" });
    
    return res.status(200).json({
      email: adminEmail,
      role: "admin",
      name: admin?.firstName || "",
      phone: admin?.phone || ""
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to load Admin"
    })
  }
}
