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
import { Collection, Mint, PresaleConfig, PublicSaleConfig, Edition } from "../generated/schema"

export function handlePublicMint(event: PublicMint): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"

    let collection = Collection.load(collectionId)!
    let edition = Edition.load(editionId)!

    if (collection === null) {
        collection = new Collection(collectionId);
    }
    if (edition === null) {
        edition = new Edition(editionId);
    }

    edition.totalMinted = edition.totalMinted.plus(event.params.quantity)
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity)



    edition.save()
    collection.save()
}

export function handlePresaleMint(event: PresaleMint): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0";


    let collection = Collection.load(collectionId)!
    let edition = Edition.load(editionId)!
    let presale = PresaleConfig.load(editionId + "-presale")
    if (collection === null) {
        collection = new Collection(collectionId);
    }
    if (edition === null) {
        edition = new Edition(editionId);
    }

    if (presale === null) {
        presale = new PresaleConfig(editionId + "-presale")
        presale.edition = editionId
    }

    presale.presaleMinted = presale.presaleMinted.plus(event.params.quantity);
    edition.totalMinted = edition.totalMinted.plus(event.params.quantity)
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity);



    edition.save()
    collection.save()
}



export function handleAdminMint(event: AdminMint): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0";

    let collection = Collection.load(collectionId)!
    let edition = Edition.load(editionId)!

    if (collection === null) {
        collection = new Collection(collectionId);
    }
    if (edition === null) {
        edition = new Edition(editionId);
    }

    edition.totalMinted = edition.totalMinted.plus(event.params.quantity)
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity)

    edition.save()
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
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"

    let collection = Collection.load(collectionId)!
    let edition = Edition.load(editionId)!

    if (collection === null) {
        collection = new Collection(collectionId);
    }
    if (edition === null) {
        edition = new Edition(editionId);
    }


    let config = event.params.newConfig;

    // add edition info
    edition.maxSupply = config.collectionSize;
    edition.uri = config.baseUri;

    // add config
    collection.logoUri = config.logoUri;
    collection.coverUri = config.coverUri;
    collection.collectionSize = config.collectionSize;

    collection.save();
    edition.save();
}

export function handlePresaleUpdated(event: PresaleUpdated): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"

    let config = event.params.newConfig

    let presale = PresaleConfig.load(editionId + "-presale")
    if (presale == null) {
        presale = new PresaleConfig(editionId + "-presale")
        presale.edition = editionId
    }

    presale.price = config.price
    presale.maxPerWallet = config.maxPerWallet
    presale.startTime = config.startTime
    presale.endTime = config.endTime
    presale.merkleRoot = config.merkleRoot
    presale.active = !config.disabled
    presale.presaleSupply = config.presaleSupply;

    presale.save();
}



export function handlePublicSaleUpdated(event: PublicSaleUpdated): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"

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



export function handleMarkleRootUpdated(event: MerkleRootUpdated): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"
    let presale = PresaleConfig.load(editionId + "-presale")
    if (presale != null) {
        presale.merkleRoot = event.params.newRoot
        presale.save()
    }
}
