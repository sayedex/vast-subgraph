import {
  Collection,
  Edition,
  PublicSaleConfig,
  PresaleConfig,
  PlatformStats
} from "../generated/schema"
import {
  AddedEdition,
  ConfigurationUpdated,
  PublicSaleUpdated,
  PresaleUpdated,
  PublicMint,
  PresaleMint,
  AdminMint,
  MerkleRootUpdated,
  SaleEndedByFactory

} from "../generated/templates/ERC1155Collection/ERC1155Collection"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"

/**
 * Creates a new Edition when a new tokenId is added to an ERC1155 collection
 */
export function handleAddedEdition(event: AddedEdition): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()

  // ================= Create Edition =================
  let edition = Edition.load(editionId);

  if (edition === null) {
    edition = new Edition(editionId)
  }

  edition.collection = collectionId
  edition.tokenId = event.params.tokenId
  edition.maxSupply = event.params.maxSupply
  edition.totalMinted = BigInt.zero()
  edition.uri = event.params.uri


  // ================= Update collection size =================

  let collection = Collection.load(collectionId)!
  collection.collectionSize =
    collection.collectionSize.plus(event.params.maxSupply)

  edition.save()
  collection.save()
}


export function handlePublicSaleUpdated(event: PublicSaleUpdated): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()
  let config = event.params.newConfig;

  // Load or create the Edition
  let edition = Edition.load(editionId)
  if (edition === null) {
    edition = new Edition(editionId);
    edition.collection = collectionId;
    edition.tokenId = event.params.tokenId
    edition.maxSupply = BigInt.zero();
    edition.totalMinted = BigInt.zero();
    edition.uri = "";
    edition.save();
  }



  let publicSale = PublicSaleConfig.load(editionId + "-public")
  if (publicSale === null) {
    publicSale = new PublicSaleConfig(editionId + "-public")
    publicSale.edition = editionId
  }

  publicSale.price = config.price
  publicSale.maxPerWallet = config.maxPerWallet
  publicSale.startTime = config.startTime
  publicSale.endTime = config.endTime;


  publicSale.save();

  // Update reverse relation in Edition
  edition.publicSale = publicSale.id
  edition.save()

}

export function handlePresaleUpdated(event: PresaleUpdated): void {
  let collectionId = event.address.toHex()

  let editionId = collectionId + "-" + event.params.tokenId.toString()
  let stageIndex = event.params.stageIndex
  let config = event.params.newConfig

  let edition = Edition.load(editionId)
  if (edition === null) {
    // If edition is missing, create a placeholder
    edition = new Edition(editionId);
    edition.collection = collectionId;
  }


  let presaleId = editionId + "-presale-" + stageIndex.toString()
  let presale = PresaleConfig.load(presaleId)
  if (presale === null) {
    presale = new PresaleConfig(presaleId);
  }

  presale.price = config.price
  presale.maxPerWallet = config.maxPerWallet
  presale.presaleSupply = config.presaleSupply
  presale.presaleMinted = config.presaleMinted;
  presale.startTime = config.startTime
  presale.endTime = config.endTime
  presale.merkleRoot = config.merkleRoot

  presale.edition = edition.id;

  presale.save();
  // Edition.presales is @derivedFrom(field: "edition"), no need to push manually
  edition.save()
}
/* ============================================================
   COLLECTION METADATA
   ============================================================ */

export function handleConfigurationUpdated(
  event: ConfigurationUpdated
): void {
  let collectionId = event.address.toHex()
  let collection = Collection.load(collectionId)!
  let config = event.params.newConfig

  collection.metadataUri = config.metadataUri
  collection.save()
}

/* ============================================================
   MINT ACCOUNTING (Edition + Collection)
   ============================================================ */

export function handlePublicMint(event: PublicMint): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()

  let quantity = event.params.quantity

  let collection = Collection.load(collectionId)!
  let edition = Edition.load(editionId)!

  edition.totalMinted = edition.totalMinted.plus(quantity)
  collection.totalMinted = collection.totalMinted.plus(quantity);

  // add fees 

  let stats = PlatformStats.load("platform");

  if (stats !== null) {
    // Assume collection.platformFee is in basis points (e.g., 200 = 2%)
    let fee = event.params.quantity.times(collection.platformFee);
    stats.totalRevenue = stats.totalRevenue.plus(fee);
    stats.totalMinted = stats.totalMinted.plus(event.params.quantity);

    stats.save();
  }



  edition.save()
  collection.save()
}

export function handlePresaleMint(event: PresaleMint): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()
  let stageIndex = event.params.stageIndex;

  let collection = Collection.load(collectionId)!
  let edition = Edition.load(editionId)!


  // Presale ID for this stage
  let presaleId = editionId + "-presale-" + stageIndex.toString();
  let presale = PresaleConfig.load(presaleId);

  if (presale === null) {
    presale = new PresaleConfig(presaleId);
    presale.edition = editionId;
  }

  presale.presaleMinted = presale.presaleMinted.plus(event.params.quantity);
  edition.totalMinted = edition.totalMinted.plus(event.params.quantity);
  collection.totalMinted = collection.totalMinted.plus(event.params.quantity);

  // add fees 

  let stats = PlatformStats.load("platform");

  if (stats !== null) {
    // Assume collection.platformFee is in basis points (e.g., 200 = 2%)
    let fee = event.params.quantity.times(collection.platformFee);
    stats.totalRevenue = stats.totalRevenue.plus(fee);
    stats.totalMinted = stats.totalMinted.plus(event.params.quantity);
    stats.save();
  }


  presale.save();
  edition.save();
  collection.save();
}

export function handleAdminMint(event: AdminMint): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()

  let quantity = event.params.quantity

  let collection = Collection.load(collectionId)!
  let edition = Edition.load(editionId)!

  edition.totalMinted = edition.totalMinted.plus(quantity)
  collection.totalMinted = collection.totalMinted.plus(quantity)

  edition.save()
  collection.save()
}



/* ============================================================
   COLLECTION STATE
   ============================================================ */

export function handleSaleEndedByFactory(
  event: SaleEndedByFactory
): void {
  let collectionId = event.address.toHex()
  let collection = Collection.load(collectionId)!

  collection.ended = event.params.ended
  collection.save()
}