const checkBlocked = (req, res, next) => {
    if (req.user.isBlocked) {
        return res.status(403).json({ message: "Your account is blocked" });
    }
    next();
};

export default checkBlocked;
