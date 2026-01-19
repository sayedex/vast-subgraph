import {
  CollectionCreated as CollectionCreatedEvent
} from "../generated/CollectionFactory/CollectionFactory"

import {
  Collection,
  Edition,
  PublicSaleConfig,
  PresaleConfig,
  PlatformStats
} from "../generated/schema"

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ERC721Collection as ERC721CollectionTemplate } from "../generated/templates"
import { ERC721Collection } from "../generated/templates/ERC721Collection/ERC721Collection"
export function handleERC721CollectionCreated(event: CollectionCreatedEvent): void {
  let collectionId = event.params.collection.toHex();

  let collection = Collection.load(collectionId);
  if (collection === null) {
    collection = new Collection(collectionId);
  }

  collection.creator = event.params.creator;
  collection.address = event.params.collection;
  collection.collectionSize = BigInt.zero();
  collection.totalMinted = BigInt.zero();
  collection.metadataUri = "";

  // ================= Contract calls =================
  let contract = ERC721Collection.bind(event.params.collection);

  let nameResult = contract.try_name();
  collection.name = nameResult.reverted ? "" : nameResult.value;

  let symbolResult = contract.try_symbol();
  collection.symbol = symbolResult.reverted ? "" : symbolResult.value;

  collection.collectionType = "SINGLE";
  collection.createdAt = event.block.timestamp;
  collection.ended = false;

  // ======= Platform fee & recipient =======
  let feeResult = contract.try_MINT_FEE();
  collection.platformFee = feeResult.reverted ? BigInt.zero() : feeResult.value;

  let recipientResult = contract.try_MINT_FEE_RECIPIENT();
  collection.platformFeeRecipient = recipientResult.reverted ? Bytes.empty() : recipientResult.value;



  collection.save();

  // ================= ERC721 = Auto Edition 0 =================
  let editionId = collectionId + "-0";

  let edition = new Edition(editionId);
  edition.collection = collectionId;
  edition.tokenId = BigInt.zero();
  edition.maxSupply = BigInt.zero();
  edition.totalMinted = BigInt.zero();
  edition.uri = "";
  edition.save();


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
  stats.singleCollections = stats.singleCollections.plus(BigInt.fromI32(1));


  stats.save();

  // ================= Spawn child indexer =================
  ERC721CollectionTemplate.create(event.params.collection);
}
