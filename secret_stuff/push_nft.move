module noop::push_nft {
     // #[allow(unused_type_parameter)]
    // /// Sets name of `DisplayDomain`
    // public fun set_push_uri<T>(
    //     domain: &mut Push,
    //     push_uri: vector<u8>,
    // ) {
    //     domain.push_uri = push_uri;
    // }

    // // === Interoperability ===

    // /// Returns whether `Push` is registered on `Nft`
    // public fun has_domain(nft: &UID): bool {
    //     df::exists_with_type<Marker<Push>, Push>(
    //         nft, marker(),
    //     )
    // }

    // /// Borrows `Push` from `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Symbol` is not registered on the `Nft`
    // public fun borrow_domain(nft: &UID): &Push {
    //     assert_push(nft);
    //     df::borrow(nft, marker<Push>())
    // }

    // /// Mutably borrows `Push` from `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Push` is not registered on the `Nft`
    // public fun borrow_domain_mut(nft: &mut UID): &mut Push {
    //     assert_push(nft);
    //     df::borrow_mut(nft, marker<Push>())
    // }

    // /// Adds `Push` to `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Push` domain already exists
    // public fun add_domain(
    //     nft: &mut UID,
    //     domain: Push,
    // ) {
    //     assert_no_push(nft);
    //     df::add(nft, marker<Push>(), domain);
    // }

    // /// Remove `Push` from `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Push` domain doesnt exist
    // public fun remove_domain(nft: &mut UID): Push {
    //     assert_push(nft);
    //     df::remove(nft, marker<Push>())
    // }

    // // === Assertions ===

    // /// Asserts that `Push` is registered on `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Push` is not registered
    // public fun assert_push(nft: &UID) {
    //     assert!(has_domain(nft), EUndefinedPush);
    // }

    // /// Asserts that `Push` is not registered on `Nft`
    // ///
    // /// #### Panics
    // ///
    // /// Panics if `Push` is registered
    // public fun assert_no_push(nft: &UID) {
    //     assert!(!has_domain(nft), EExistingPush);
    // }
}