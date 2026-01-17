import {
  CollectionCreated as CollectionCreatedEvent,
  FactoryOwnerTransferred as FactoryOwnerTransferredEvent
} from "../generated/CollectionFactory/CollectionFactory"
import { CollectionCreated, FactoryOwnerTransferred } from "../generated/schema"

export function handleCollectionCreated(event: CollectionCreatedEvent): void {
  let entity = new CollectionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.collection = event.params.collection

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFactoryOwnerTransferred(
  event: FactoryOwnerTransferredEvent
): void {
  let entity = new FactoryOwnerTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldOwner = event.params.oldOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
