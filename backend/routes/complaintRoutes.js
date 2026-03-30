// DELETE all complaints
router.delete('/delete-all', async (req, res) => {
  try {
    await Complaint.deleteMany({});
    res.status(200).json({ message: 'All complaints deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete complaints' });
  }
});
