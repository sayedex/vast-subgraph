import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  CollectionCreated,
  FactoryOwnerTransferred
} from "../generated/CollectionFactory/CollectionFactory"

export function createCollectionCreatedEvent(
  creator: Address,
  collection: Address
): CollectionCreated {
  let collectionCreatedEvent = changetype<CollectionCreated>(newMockEvent())

  collectionCreatedEvent.parameters = new Array()

  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "collection",
      ethereum.Value.fromAddress(collection)
    )
  )

  return collectionCreatedEvent
}

export function createFactoryOwnerTransferredEvent(
  oldOwner: Address,
  newOwner: Address
): FactoryOwnerTransferred {
  let factoryOwnerTransferredEvent =
    changetype<FactoryOwnerTransferred>(newMockEvent())

  factoryOwnerTransferredEvent.parameters = new Array()

  factoryOwnerTransferredEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  factoryOwnerTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return factoryOwnerTransferredEvent
}
