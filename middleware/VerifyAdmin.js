export const verifyAdmin = (req, res, next) => {
    if (req.email !== "teamgaptech@gmail.com") return res.status(403).json({ msg: "Anda tidak memiliki akses" });
    next();
}