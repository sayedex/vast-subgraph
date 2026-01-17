import {
  CollectionCreated as CollectionCreatedEvent
} from "../generated/CollectionFactory/CollectionFactory"

import {
  Collection,
  PublicSaleConfig,
  PresaleConfig
} from "../generated/schema"

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ERC721Collection as ERC721CollectionTemplate } from "../generated/templates"

export function handleCollectionCreated(event: CollectionCreatedEvent): void {
  let id = event.params.collection.toHex()

  let collection = Collection.load(id)
  if (collection === null) {
    // ================= Collection =================

    collection = new Collection(id)
    /// ten
    collection.creator = event.params.creator;
    collection.address = event.params.collection
    collection.collectionSize = BigInt.zero();
    collection.totalMinted = BigInt.zero()

    collection.baseUri = ""
    collection.logoUri = ""
    collection.coverUri = ""

    collection.collectionType = "SINGLE"

    collection.createdAt = event.block.timestamp
    collection.ended = false

    // Link relations (1–1)
    collection.publicSale = id
    collection.presale = id

    collection.save()

    // ================= Public Sale Config =================

    let publicSale = new PublicSaleConfig(id)
    publicSale.collection = id
    publicSale.price = BigInt.zero()
    publicSale.maxPerWallet = BigInt.zero()
    publicSale.startTime = BigInt.zero()
    publicSale.endTime = BigInt.zero()
    publicSale.disabled = true
    publicSale.save()

    // ================= Presale Config =================

    let presale = new PresaleConfig(id)
    presale.collection = id
    presale.price = BigInt.zero()
    presale.maxPerWallet = BigInt.zero()
    presale.presaleSupply = BigInt.zero()
    presale.presaleMinted = BigInt.zero()
    presale.startTime = BigInt.zero()
    presale.endTime = BigInt.zero()
    presale.merkleRoot = Bytes.fromHexString(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) as Bytes
    presale.disabled = true
    presale.save()

    // ================= Spawn child indexer =================

    ERC721CollectionTemplate.create(event.params.collection)
  }


}
