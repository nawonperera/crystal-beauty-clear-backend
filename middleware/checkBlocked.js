const checkBlocked = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (req.user.isDisabled) {
        return res.status(403).json({ message: "Your account is blocked" });
    }

    next();
};

export default checkBlocked;
