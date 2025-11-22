import jwt from 'jsonwebtoken'


export const generateAdminToken = async (email) => {
  try {
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '3d'})
    return token
  } catch (error) {
    console.log("Admin token not generated")
  }
}