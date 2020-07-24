cantAssertQueue = (error) =>  `We can't assert queue because we had some issue ${error}`
cantOpenChannel = (error) =>  `We can't open a channel because we had some issue ${error}`

module.exports = {cantAssertQueue,cantOpenChannel};