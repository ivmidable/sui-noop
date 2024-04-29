module noop::suimigos {
//     use std::string::{Self, String};
//     use std::option;
//     use sui::display;

//     use sui::transfer;
//     use sui::object::{Self, UID};
//     use sui::tx_context::{Self, TxContext};

//     use ob_utils::utils;
//     use nft_protocol::tags;
//     use nft_protocol::mint_event;
//     use nft_protocol::royalty;
//     use nft_protocol::creators;
//     use nft_protocol::transfer_allowlist;
//     use nft_protocol::p2p_list;
//     use ob_utils::display as ob_display;
//     use nft_protocol::collection;
//     use nft_protocol::nft;
//     use nft_protocol::mint_cap::{Self, MintCap};
//     use nft_protocol::royalty_strategy_bps;
//     use ob_permissions::witness;

//     use ob_request::transfer_request;
//     use ob_request::borrow_request::{Self, BorrowRequest, ReturnPromise};
//     use ob_launchpad::warehouse::{Self, Warehouse};

//     struct Suimigos has key, store{
//         id:UID,
//         name:String,
//         push:Push,
//         // description:String,
//         // url:String,
//         // data:vector<u8>
//   }

//     /// One time witness is only instantiated in the init method
//     struct SUIMIGOS has drop {}

//     /// Can be used for authorization of other actions post-creation. It is
//     /// vital that this struct is not freely given to any contract, because it
//     /// serves as an auth token.
//     struct Witness has drop {}

//     #[lint_allow(share_owned, self_transfer)]
//     fun init(otw: SUIMIGOS, ctx: &mut TxContext) {
//         let sender = tx_context::sender(ctx);

//         // 1. Init Collection & MintCap with unlimited supply
//         let (collection, mint_cap) = collection::create_with_mint_cap<SUIMIGOS, Submigos>(
//             &otw, option::none(), ctx
//         );

//         // 2. Init Publisher & Delegated Witness
//         let publisher = sui::package::claim(otw, ctx);
//         let dw = witness::from_witness(Witness {});

//         // === NFT DISPLAY ===

//         // 3. Init Display
//         let tags = vector[tags::art(), tags::collectible()];

//         let display = display::new<Suimigos>(&publisher, ctx);
//         display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
//         display::add(&mut display, string::utf8(b"tags"), ob_display::from_vec(tags));
//         display::add(&mut display, string::utf8(b"collection_id"), ob_display::id_to_string(&object::id(&collection)));
//         display::update_version(&mut display);
//         transfer::public_transfer(display, tx_context::sender(ctx));

//         // === COLLECTION DOMAINS ===

//         // add push domain
//         collection::add_domain(
//             dw,
//             &mut collection,

//         )


//         // 4. Add Creator metadata to the collection

//         // Insert Creator addresses here
//         let creators = vector[
//             tx_context::sender(ctx)
//         ];

//         collection::add_domain(
//             dw,
//             &mut collection,
//             creators::new(utils::vec_set_from_vec(&creators)),
//         );

//         // 5. Setup royalty basis points
//         // 2_000 BPS == 20%
//         let shares = vector[10_000];
//         let shares = utils::from_vec_to_map(creators, shares);

//         royalty_strategy_bps::create_domain_and_add_strategy(
//             dw, &mut collection, royalty::from_shares(shares, ctx), 100, ctx,
//         );
    

//         // === TRANSFER POLICIES ===

//         // 6. Creates a new policy and registers an allowlist rule to it.
//         // Therefore now to finish a transfer, the allowlist must be included
//         // in the chain.
//         let (transfer_policy, transfer_policy_cap) =
//             transfer_request::init_policy<SUIMIGOS>(&publisher, ctx);

//         royalty_strategy_bps::enforce(&mut transfer_policy, &transfer_policy_cap);
//         transfer_allowlist::enforce(&mut transfer_policy, &transfer_policy_cap);

//         // 7. P2P Transfers are a separate transfer workflow and therefore require a
//         // separate policy
//         let (p2p_policy, p2p_policy_cap) =
//             transfer_request::init_policy<SUIMIGOS>(&publisher, ctx);

//         p2p_list::enforce(&mut p2p_policy, &p2p_policy_cap);

//         // === CLOSE ===

//         transfer::public_transfer(mint_cap, sender);
//         transfer::public_transfer(publisher, sender);
//         transfer::public_transfer(transfer_policy_cap, sender);
//         transfer::public_transfer(p2p_policy_cap, sender);
//         transfer::public_share_object(collection);
//         transfer::public_share_object(transfer_policy);
//         transfer::public_share_object(p2p_policy);
//     }

//     public fun get_nft_field<Auth: drop, Field: store>(
//         request: &mut BorrowRequest<Auth, SUIMIGOS>,
//     ): (Field, ReturnPromise<Suimigos, Field>) {
//         let dw = witness::from_witness(Witness {});
//         let nft = borrow_request::borrow_nft_ref_mut(dw, request);

//         borrow_request::borrow_field(dw, &mut nft.id)
//     }

//     public fun return_nft_field<Auth: drop, Field: store>(
//         request: &mut BorrowRequest<Auth, SUIMIGOS>,
//         field: Field,
//         promise: ReturnPromise<Suimigos, Field>,
//     ) {
//         let dw = witness::from_witness(Witness {});
//         let nft = borrow_request::borrow_nft_ref_mut(dw, request);

//         borrow_request::return_field(dw, &mut nft.id, promise, field)
//     }

//     public fun get_nft<Auth: drop>(
//         request: &mut BorrowRequest<Auth, Suimigos>,
//     ): Suimigos {
//         let dw = witness::from_witness(Witness {});
//         borrow_request::borrow_nft(dw, request)
//     }

//     public fun return_nft<Auth: drop>(
//         request: &mut BorrowRequest<Auth, Suimigos>,
//         nft: Suimigos,
//     ) {
//         let dw = witness::from_witness(Witness {});
//         borrow_request::return_nft(dw, request, nft);
//     }

//     public fun mint_nft(
//         mint_cap: &MintCap<Suimigos>,
//         name: String,
//         index: u64,

//     ) {
//         let nft = mint_nft_v1(
//             name,
//             index,
//             ctx
//         );

//         // mint_event::emit_mint(
//         //     witness::from_witness(Witness {}),
//         //     mint_cap::collection_id(mint_cap),
//         //     &nft,
//         // );
//     }

//     public fun add_push(
//         pub: &Publisher,
//         nft: &Suimigos,
//         push: Push
//     ) : &Suimigos {
//          assert!(package::from_package<T>(pub), 0);

//         let fields = vector[utf8(b"push")];
//         let values = vector[push];

//         // Get a new `Display` object for the `T` type.
//         let display = display::new_with_fields<T>(
//             pub, fields, values, ctx
//         );

//         // Commit first version of `Display` to apply changes.
//         display::update_version(&mut display);

//     }

//     public fun deposit_nft(
//         nft: &Suimigos,
//         mint_cap: &MintCap<Suimigos>,
//         warehouse: &mut Warehouse<Suimigos>,
//         ctx: &mut TxContext,
//     ) {
//          warehouse::deposit_nft(warehouse, nft);
//     }


//     fun mint_nft_v1(
//         name: String,
//         index: u64,
//         ctx: &mut TxContext,
//     ): Suimigos {
//         Suimigos {
//             id: object::new(ctx),
//             name,
//             index,
//         }
//     }

//     #[test_only]
//     use sui::test_scenario::{Self, ctx};
//     #[test_only]
//     const CREATOR: address = @0xA1C04;

//     #[test]
//     fun it_inits_collection() {
//         let scenario = test_scenario::begin(CREATOR);
//         init(SUIMIGOS {}, ctx(&mut scenario));

//         test_scenario::end(scenario);
//     }
}
