import {
    PublicMint,
    PresaleMint,
    AdminMint,
    SaleEndedByFactory,
    ConfigurationUpdated,
    PresaleUpdated,
    PublicSaleUpdated,
    MerkleRootUpdated
} from "../generated/templates/ERC721Collection/ERC721Collection"
import { Collection, Mint, PresaleConfig, PublicSaleConfig } from "../generated/schema"

export function handlePublicMint(event: PublicMint): void {
    let id = event.address.toHex()
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity)
    collection.save()
}

export function handlePresaleMint(event: PresaleMint): void {

    let id = event.address.toHex()
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }

    let presale = PresaleConfig.load(id)
    if (presale === null) {
        presale = new PresaleConfig(id)
        presale.collection = id
    }

    presale.presaleMinted = presale.presaleMinted.plus(event.params.quantity)
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity)
    presale.save();
    collection.save()
}

export function handleAdminMint(event: AdminMint): void {
    let id = event.address.toHex()
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity)
    collection.save()

}

export function handleSaleEnded(event: SaleEndedByFactory): void {

    let id = event.address.toHex()
    let collection = Collection.load(id)
    if (collection === null) {
        collection = new Collection(id);
    }

    collection.ended = event.params.ended;
    collection.save();
}

export function handleConfigurationUpdated(event: ConfigurationUpdated): void {
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
    if (presale === null) {
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

export function handleMarkleRootUpdated(event: MerkleRootUpdated): void {
    let id = event.address.toHex()
    let presale = PresaleConfig.load(id)
    if (presale === null) {
        presale = new PresaleConfig(id)
        presale.collection = id
    }

    presale.merkleRoot = event.params.newRoot;
    presale.save();
}