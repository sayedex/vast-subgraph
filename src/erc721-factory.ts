import {
  CollectionCreated as CollectionCreatedEvent
} from "../generated/CollectionFactory/CollectionFactory"

import {
  Collection,
  Edition,
  PublicSaleConfig,
  PresaleConfig
} from "../generated/schema"

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ERC721Collection as ERC721CollectionTemplate } from "../generated/templates"
import { ERC721Collection } from "../generated/templates/ERC721Collection/ERC721Collection"
export function handleERC721CollectionCreated(event: CollectionCreatedEvent): void {
  let collectionId = event.params.collection.toHex()

  let collection = Collection.load(collectionId)

  if (collection === null) {
    collection = new Collection(collectionId)
  }

  collection.creator = event.params.creator
  collection.address = event.params.collection
  collection.collectionSize = BigInt.zero()
  collection.totalMinted = BigInt.zero()

  collection.logoUri = ""
  collection.coverUri = ""

  // ================= Contract calls =================

  let contract = ERC721Collection.bind(event.params.collection)

  let nameResult = contract.try_name()
  collection.name = nameResult.reverted ? "" : nameResult.value

  let symbolResult = contract.try_symbol()
  collection.symbol = symbolResult.reverted ? "" : symbolResult.value


  collection.collectionType = "SINGLE"
  collection.createdAt = event.block.timestamp
  collection.ended = false

  collection.save()

  // ================= ERC721 = Auto Edition 0 =================

  let editionId = collectionId + "-0"

  let edition = new Edition(editionId)
  edition.collection = collectionId
  edition.tokenId = BigInt.zero()
  edition.maxSupply = BigInt.zero()
  edition.totalMinted = BigInt.zero()
  edition.uri = ""
  // ================= Public Sale (Edition scoped) =================

  let publicSale = new PublicSaleConfig(editionId + "-public")
  publicSale.edition = editionId
  publicSale.price = BigInt.zero()
  publicSale.maxPerWallet = BigInt.zero()
  publicSale.startTime = BigInt.zero()
  publicSale.endTime = BigInt.zero()
  publicSale.active = false
  publicSale.save()

  // ================= Presale (Edition scoped) =================

  let presale = new PresaleConfig(editionId + "-presale")
  presale.edition = editionId
  presale.price = BigInt.zero()
  presale.maxPerWallet = BigInt.zero();
  presale.presaleSupply = BigInt.zero();
  presale.presaleMinted = BigInt.zero();
  presale.startTime = BigInt.zero()
  presale.endTime = BigInt.zero()
  presale.merkleRoot = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) as Bytes
  presale.active = false
  presale.save()

  edition.publicSale = publicSale.id
  edition.presale = presale.id
  edition.save()

  // ================= Spawn child indexer =================

  ERC721CollectionTemplate.create(event.params.collection)
}
