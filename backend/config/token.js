import jwt from 'jsonwebtoken'


export const generateToken =async (userId) => {
  try {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "3d"})
    return token
  } catch (error) {
    console.log("Token generation failed")
  }
}