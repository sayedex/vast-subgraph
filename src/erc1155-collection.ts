import {
    Collection,
    Edition,
    PublicSaleConfig,
    PresaleConfig
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

    let edition = new Edition(editionId)

    edition.collection = collectionId
    edition.tokenId = event.params.tokenId
    edition.maxSupply = event.params.maxSupply
    edition.totalMinted = BigInt.zero()
    edition.uri = event.params.uri

    // ================= Create default Public Sale =================

    let publicSale = new PublicSaleConfig(editionId + "-public")
    publicSale.edition = editionId
    publicSale.price = BigInt.zero()
    publicSale.maxPerWallet = BigInt.zero()
    publicSale.startTime = BigInt.zero()
    publicSale.endTime = BigInt.zero()
    publicSale.active = false
    publicSale.save()

    // ================= Create default Presale =================

    let presale = new PresaleConfig(editionId + "-presale")
    presale.edition = editionId
    presale.price = BigInt.zero()
    presale.maxPerWallet = BigInt.zero()
    presale.startTime = BigInt.zero()
    presale.presaleMinted = BigInt.zero();
    presale.presaleSupply = BigInt.zero();
    presale.endTime = BigInt.zero()
    presale.merkleRoot = Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) as Bytes

    presale.active = false
    presale.save()

    // ================= Update collection size =================

    let collection = Collection.load(collectionId)!
    collection.collectionSize =
        collection.collectionSize.plus(event.params.maxSupply)

    
    edition.publicSale = publicSale.id;
    edition.presale = presale.id;
    edition.save()    
    collection.save()
}

export function handlePublicSaleUpdated(event: PublicSaleUpdated): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()

  let config = event.params.newConfig

  let publicSale = PublicSaleConfig.load(editionId + "-public")
  if (publicSale == null) {
    publicSale = new PublicSaleConfig(editionId + "-public")
    publicSale.edition = editionId
  }

  publicSale.price = config.price
  publicSale.maxPerWallet = config.maxPerWallet
  publicSale.startTime = config.startTime
  publicSale.endTime = config.endTime
  publicSale.active = !config.disabled

  publicSale.save()
}

export function handlePresaleUpdated(event: PresaleUpdated): void {
  let collectionId = event.address.toHex()
  let editionId =
    collectionId + "-" + event.params.tokenId.toString()

  let config = event.params.newConfig

  let presale = PresaleConfig.load(editionId + "-presale")
  if (presale == null) {
    presale = new PresaleConfig(editionId + "-presale")
    presale.edition = editionId
  }

  presale.price = config.price
  presale.maxPerWallet = config.maxPerWallet
  presale.startTime = config.startTime
  presale.presaleSupply = config.presaleSupply;
  presale.endTime = config.endTime
  presale.merkleRoot = config.merkleRoot
  presale.active = !config.disabled

  presale.save()
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

  collection.coverUri = config.coverUri
  collection.logoUri = config.logoUri;


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
  collection.totalMinted = collection.totalMinted.plus(quantity)

  edition.save()
  collection.save()
}

export function handlePresaleMint(event: PresaleMint): void {
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