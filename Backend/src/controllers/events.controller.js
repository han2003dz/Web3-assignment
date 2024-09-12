const events = async (req, res) => {
  try {
    const events = await contract.getPastEvents("DepositMade", {
      fromBlock: 43229329,
      toBlock: 43229600,
    });
    console.log("events", events);
    res.json("OK");
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Error fetching events");
  }
};

module.exports = {
  events,
};
