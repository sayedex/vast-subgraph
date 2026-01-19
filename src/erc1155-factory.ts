import {
  CollectionCreated as CollectionCreatedEvent
} from "../generated/ERC1155Factory/ERC1155Factory"

import {
  Collection,
  PlatformStats,
  Edition,
  PublicSaleConfig,
  PresaleConfig
} from "../generated/schema"
import { ERC1155Collection } from "../generated/templates/ERC1155Collection/ERC1155Collection"


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



  // ================= Contract calls =================
  let contract = ERC1155Collection.bind(event.params.collection);

  let nameResult = contract.try_name();
  collection.name = nameResult.reverted ? "" : nameResult.value;

  let symbolResult = contract.try_symbol();
  collection.symbol = symbolResult.reverted ? "" : symbolResult.value;


  collection.metadataUri = ""
  collection.collectionType = "MULTI" // ERC1155

     // ======= Platform fee & recipient =======
  let feeResult = contract.try_MINT_FEE();
  collection.platformFee = feeResult.reverted ? BigInt.zero() : feeResult.value;

  let recipientResult = contract.try_MINT_FEE_RECIPIENT();
  collection.platformFeeRecipient = recipientResult.reverted ? Bytes.empty() : recipientResult.value;



  collection.createdAt = event.block.timestamp
  collection.ended = false


  collection.save();

    let statsId = "platform";
    let stats = PlatformStats.load(statsId);
    if (stats === null) {
      stats = new PlatformStats(statsId);
      stats.totalRevenue = BigInt.zero();
      stats.totalCollections = BigInt.zero();
      stats.singleCollections = BigInt.zero();
      stats.multiCollections = BigInt.zero();
      stats.totalMinted = BigInt.zero();
    }
  
    stats.totalCollections = stats.totalCollections.plus(BigInt.fromI32(1));
    stats.multiCollections = stats.multiCollections.plus(BigInt.fromI32(1));
    


  // ================= Spawn child indexer =================


  ERC1155CollectionTemplate.create(event.params.collection)
}