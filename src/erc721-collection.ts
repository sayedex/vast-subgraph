import {
    PublicMint,
    PresaleMint,
    AdminMint,
    SaleEndedByFactory,
    ConfigurationUpdated,
    PresaleUpdated,
    PublicSaleUpdated
} from "../generated/templates/ERC721Collection/ERC721Collection"
import { log } from "@graphprotocol/graph-ts"
import { Collection, Mint, PresaleConfig, PublicSaleConfig } from "../generated/schema"

export function handlePublicMint(event: PublicMint): void {
    let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

    let mint = new Mint(id)
    mint.collection = event.address.toHex()
    mint.user = event.params.minter
    mint.quantity = event.params.quantity
    mint.type = "PUBLIC"
    mint.timestamp = event.block.timestamp

    mint.save()
}

export function handlePresaleMint(event: PresaleMint): void {

    let id = event.params.collection.toHex()
    let collection = Collection.load(id);
    if (collection == null) {
        collection = new Collection(id);
    }

    let mint = new Mint(id)
    mint.collection = event.address.toHex()
    mint.user = event.params.minter
    mint.quantity = event.params.quantity
    mint.type = "PRESALE"
    mint.timestamp = event.block.timestamp

    mint.save()
}

export function handleAdminMint(event: AdminMint): void {
    let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

    let mint = new Mint(id)
    mint.collection = event.address.toHex()
    mint.user = event.params.minter;
    mint.quantity = event.params.quantity
    mint.type = "ADMIN"
    mint.timestamp = event.block.timestamp

    mint.save()
}

export function handleSaleEnded(event: SaleEndedByFactory): void {
    //   let collection = Collection.load(event.address.toHex())
    //   if (collection == null) return

    //   collection.ended = event.params._ended
    //   collection.save()
}

export function handleConfigurationUpdated(event: ConfigurationUpdated): void {

    log.info("handlePublicSaleUpdated called for collection {}", [event.address.toHex()])
    let id = event.address.toHex()
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }


    let config = event.params.newConfig;

    // add config..
    collection.baseUri = config.baseUri;
    collection.logoUri = config.logoUri;
    collection.coverUri = config.coverUri;
    collection.collectionSize = config.collectionSize;
    collection.creator = config.owner;
    collection.save()
}

export function handlePresaleUpdated(event: PresaleUpdated): void {
    let id = event.address.toHex() // collection address used as ID

    let config = event.params.newConfig;

    // Load the collection (optional, for safety)
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }


    // Load the presale config entity
    let presale = PresaleConfig.load(id)
    if (presale=== null) {
        // If somehow it doesn't exist, create it
        presale = new PresaleConfig(id)
        presale.collection = id
    }

    // Update all presale fields from the event
    presale.price = config.price
    presale.maxPerWallet = config.maxPerWallet
    presale.presaleSupply = config.presaleSupply
    //presale.presaleMinted = config.presaleMinted
    presale.startTime = config.startTime
    presale.endTime = config.endTime
    presale.merkleRoot = config.merkleRoot
    presale.disabled = config.disabled

    presale.save()
}

export function handlePublicSaleUpdated(event: PublicSaleUpdated): void {
    let id = event.address.toHex() // collection address used as ID

    let config = event.params.newConfig;

    // Optional: check if collection exists
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }


    // Load or create the PublicSaleConfig entity
    let publicSale = PublicSaleConfig.load(id)
    if (publicSale === null) {
        publicSale = new PublicSaleConfig(id)
        publicSale.collection = id
    }

    // Update fields from the event
    publicSale.price = config.price
    publicSale.maxPerWallet = config.maxPerWallet
    publicSale.startTime = config.startTime
    publicSale.endTime = config.endTime
    publicSale.disabled = config.disabled

    publicSale.save()
}