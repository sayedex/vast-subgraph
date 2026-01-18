import {
  CollectionCreated as CollectionCreatedEvent
} from "../generated/ERC1155Factory/ERC1155Factory"

import {
  Collection,
  Edition,
  PublicSaleConfig,
  PresaleConfig
} from "../generated/schema"


import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ERC1155Collection as ERC1155CollectionTemplate } from "../generated/templates"


export function handleERC1155CollectionCreated(event: CollectionCreatedEvent): void {
  let collectionId = event.params.collection.toHex()


  let collection = Collection.load(collectionId)

  if (collection === null) {
    collection = new Collection(collectionId)
  }




  // ================= Collection =================

  collection.creator = event.params.creator
  collection.address = event.params.collection
  collection.collectionSize = BigInt.zero()
  collection.totalMinted = BigInt.zero()

  collection.logoUri = ""
  collection.coverUri = ""
  collection.name=""
  collection.symbol = ""

  collection.collectionType = "MULTI" // ERC1155


  collection.createdAt = event.block.timestamp
  collection.ended = false


  collection.save()


  // ================= Spawn child indexer =================


  ERC1155CollectionTemplate.create(event.params.collection)
}