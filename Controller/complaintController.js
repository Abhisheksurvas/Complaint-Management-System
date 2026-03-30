exports.deleteAllComplaints = async (req, res) => {
  const userId = req.user.id;

  const result = await Complaint.deleteMany({ userId });

  res.json({
    message: "All complaints deleted successfully",
    deletedCount: result.deletedCount
  });
};
