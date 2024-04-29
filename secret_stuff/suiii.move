/// Implements a contract that mints NFTs with a globally unique symbol and
/// allows associating them with collections
module noop::sui_ {
    // use std::string::{Self, String};

    // use sui::display;
    // use sui::transfer;
    // use sui::object::{Self, UID};
    // use sui::tx_context::{Self, TxContext};
    // use sui::vec_set::{Self, VecSet};

    // use ob_permissions::witness;
    // use nft_protocol::display_info;
    // use nft_protocol::collection::{Self, Collection};
    // use noop::push;

    // /// One time witness is only instantiated in the init method
    // struct PUSH has drop {}

    // /// Used for authorization of other protected actions.
    // ///
    // /// `Witness` must not be freely exposed to any contract.
    // struct Witness has drop {}

    // /// Domain holding a globally unique symbol
    // struct PushCap has key, store {
    //     id: UID,
    //     /// Unique symbol
    //     push_id: ID,
    // }

    // struct PushUri has store {
    //     /// Digest of Push.
    //     uri: vector<u8>,
    // }

    // /// Collection domain responsible for storing symbols already registered
    // struct Registry has store {
    //     /// Registered symbols
    //     pushes: Table<ID>,
    // }

    // #[lint_allow(share_owned, self_transfer)]
    // /// Adds registration to `RegistryDomain` and returns unique `SymbolDomain`
    // fun register(
    //     registry: &mut Registry,
    //     push: Push,
    //     ctx: &mut TxContext,
    // ): PushCap {
    //     vec_set::insert(&mut registry.pushes, push);
    //     PushCap { id: object::new(ctx), push }
    // }

    // // === Contract functions ===

    // #[lint_allow(self_transfer, share_owned)]
    // /// Called during contract publishing
    // fun init(otw: PUSH, ctx: &mut TxContext) {

    //     // Setup `Display`
    //     let publisher = sui::package::claim(otw, ctx);

    //     //let display = display::new<PushCap>(&publisher, ctx);
    //     // let keys = vector[
    //     //     utf8(b"id"),
    //     //     utf8(b"link"),
    //     //     utf8(b"image_url"),
    //     //     utf8(b"description"),
    //     //     utf8(b"project_url"),
    //     //     utf8(b"creator"),
    //     // ];
    //     // let values = vector[
    //     //     // For `name` we can use the `Hero.name` property
    //     //     utf8(b"{id}"),
    //     //     // For `link` we can build a URL using an `id` property
    //     //     utf8(b"https://sui-heroes.io/hero/{id}"),
    //     //     // For `image_url` we use an IPFS template + `img_url` property.
    //     //     utf8(b"ipfs://{img_url}"),
    //     //     // Description is static for all `Hero` objects.
    //     //     utf8(b"A true Hero of the Sui ecosystem!"),
    //     //     // Project URL is usually static
    //     //     utf8(b"https://sui-heroes.io"),
    //     //     // Creator field can be any
    //     //     utf8(b"Unknown Sui Fan")
    //     // ];

    //     //display::add(&mut display, string::utf8(b"name"), string::utf8(b"{symbol}"));
    //     //display::update_version(&mut display);
    //     //transfer::public_transfer(display, tx_context::sender(ctx));

    //     let delegated_witness = witness::from_witness(Witness {});

    //     let collection: Collection<Push> =
    //         collection::create(delegated_witness, ctx);

    //     collection::add_domain(
    //         delegated_witness,
    //         &mut collection,
    //         display_info::new(
    //             string::utf8(b"Push"),
    //             string::utf8(b"Collection of Noop Push digests."),
    //         )
    //     );

    //     collection::add_domain(
    //         delegated_witness,
    //         &mut collection,
    //         Registry { symbols: vec_set::empty() },
    //     );

    //     transfer::public_transfer(publisher, tx_context::sender(ctx));
    //     transfer::public_share_object(collection);
    // }

    // /// Mint `Nft` with `Push` from unique `PushCap`
    // public fun mint_nft(
    //     cap: &PushCap,
    //     ctx: &mut TxContext,
    // ): PushNft {
    //     let nft = ExampleNft {
    //         id: object::new(ctx),
    //         symbol: Symbol {symbol: cap.symbol}
    //     };

    //     nft
    // }

    // #[lint_allow(self_transfer)]
    // /// Call to mint an globally unique NFT Symbol
    // public entry fun mint_symbol(
    //     collection: &mut Collection<EXAMPLE_SYMBOL>,
    //     symbol: String,
    //     ctx: &mut TxContext,
    // ) {
    //     let delegated_witness = witness::from_witness(Witness {});

    //     let registry: &mut Registry =
    //         collection::borrow_domain_mut(delegated_witness, collection);

    //     let cap = register(registry, symbol, ctx);

    //     transfer::public_transfer(cap, tx_context::sender(ctx));
    // }


    // #[test_only]
    // use sui::test_scenario::{Self, ctx};
    // #[test_only]
    // const USER: address = @0xA1C04;

    // #[test]
    // fun it_inits_collection() {
    //     let scenario = test_scenario::begin(USER);
    //     init(PUSH {}, ctx(&mut scenario));

    //     test_scenario::end(scenario);
    // }
}