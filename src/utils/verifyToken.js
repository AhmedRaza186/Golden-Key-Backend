import jwt from "jsonwebtoken";



export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      console.log(err);
      
      return res.status(403).json({ message: "Token is not Valid!" });
    }
    req.userId = payload.id;

    next();
  });
  
} catch (error) {
  console.log(error);
  return res.status(500).json({ message: "Internal Server Error" });
  
}
};