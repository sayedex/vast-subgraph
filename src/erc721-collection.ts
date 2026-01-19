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
import { Collection, Mint, PresaleConfig, PublicSaleConfig, Edition, PlatformStats } from "../generated/schema"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
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
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity);


    // add fees 
    let stats = PlatformStats.load("platform");
    if (stats !== null) {
        // Assume collection.platformFee is in basis points (e.g., 200 = 2%)
        let fee = event.params.quantity.times(collection.platformFee);
        stats.totalRevenue = stats.totalRevenue.plus(fee);
        stats.totalMinted = stats.totalMinted.plus(event.params.quantity);
        stats.save();
    }

    edition.save()
    collection.save();



}

export function handlePresaleMint(event: PresaleMint): void {
    let collectionId = event.address.toHex();
    let editionId = collectionId + "-0";
    let stageIndex = event.params.stageIndex;

    let collection = Collection.load(collectionId)!;
    let edition = Edition.load(editionId)!;

    // Presale ID for this stage
    let presaleId = editionId + "-presale-" + stageIndex.toString();
    let presale = PresaleConfig.load(presaleId);

    if (presale == null) {
        presale = new PresaleConfig(presaleId);
        presale.edition = editionId;
        presale.price = BigInt.zero();
        presale.maxPerWallet = BigInt.zero();
        presale.presaleSupply = BigInt.zero();
        presale.presaleMinted = BigInt.zero();
        presale.startTime = BigInt.zero();
        presale.endTime = BigInt.zero();
        presale.merkleRoot = Bytes.fromHexString(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) as Bytes;
    }

    presale.presaleMinted = presale.presaleMinted.plus(event.params.quantity);
    edition.totalMinted = edition.totalMinted.plus(event.params.quantity);
    collection.totalMinted = collection.totalMinted.plus(event.params.quantity);

    // add fees 

    let stats = PlatformStats.load("platform");

    if (stats !== null) {
        // Assume collection.platformFee is in basis points (e.g., 200 = 2%)
        let fee = event.params.quantity.times(collection.platformFee);
        stats.totalRevenue = stats.totalRevenue.plus(fee);
        stats.totalMinted = stats.totalMinted.plus(event.params.quantity);

        stats.save();
    }



    presale.save();
    edition.save();
    collection.save();
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
    collection.metadataUri = config.metadataUri;
    collection.collectionSize = config.collectionSize;

    collection.save();
    edition.save();
}

export function handlePresaleUpdated(event: PresaleUpdated): void {
    let collectionId = event.address.toHex();
    let editionId = collectionId + "-0"; // ERC1155 tokenId, adjust if needed
    let stageIndex = event.params.stageIndex;
    let config = event.params.newConfig;

    // Load Edition first, must exist
    let edition = Edition.load(editionId);
    if (edition === null) {
        // If edition is missing, create a placeholder
        edition = new Edition(editionId);
        edition.collection = collectionId;
        edition.tokenId = BigInt.zero();
        edition.maxSupply = BigInt.zero();
        edition.totalMinted = BigInt.zero();
        edition.uri = "";
        edition.save();
    }

    // Each presale stage gets a unique PresaleConfig ID
    let presaleId = editionId + "-presale-" + stageIndex.toString();
    let presale = PresaleConfig.load(presaleId);

    if (presale === null) {
        presale = new PresaleConfig(presaleId);
        // presale.edition = edition.id;
        // presale.price = BigInt.zero();
        // presale.maxPerWallet = BigInt.zero();
        // presale.presaleSupply = BigInt.zero();
        // presale.presaleMinted = BigInt.zero(); // required!
        // presale.startTime = BigInt.zero();
        // presale.endTime = BigInt.zero();
        // presale.merkleRoot = Bytes.fromHexString(
        //   "0x0000000000000000000000000000000000000000000000000000000000000000"
        // ) as Bytes;
    }

    // Update with new config
    presale.price = config.price;
    presale.maxPerWallet = config.maxPerWallet;
    presale.presaleSupply = config.presaleSupply;
    presale.presaleMinted = BigInt.zero(); // reset minted if you want
    presale.startTime = config.startTime;
    presale.endTime = config.endTime;
    presale.merkleRoot = config.merkleRoot;
    presale.edition = edition.id;

    presale.save();

    // Edition.presales is @derivedFrom(field: "edition"), no need to push manually
    edition.save();
}


export function handlePublicSaleUpdated(event: PublicSaleUpdated): void {
    let collectionId = event.address.toHex()
    let editionId = collectionId + "-0"
    let config = event.params.newConfig;

    // Load or create the Edition
    let edition = Edition.load(editionId)
    if (edition == null) {
        edition = new Edition(editionId)
        edition.collection = collectionId
        edition.tokenId = BigInt.zero()
        edition.maxSupply = BigInt.zero()
        edition.totalMinted = BigInt.zero()
        edition.uri = ""
    }



    let publicSale = PublicSaleConfig.load(editionId + "-public")
    if (publicSale === null) {
        publicSale = new PublicSaleConfig(editionId + "-public")
        publicSale.edition = editionId
    }

    publicSale.price = config.price
    publicSale.maxPerWallet = config.maxPerWallet
    publicSale.startTime = config.startTime
    publicSale.endTime = config.endTime

    publicSale.save()

    // Update reverse relation in Edition
    edition.publicSale = publicSale.id
    edition.save()
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
