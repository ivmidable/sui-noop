module noop::push {
    use std::string::String;
    use std::vector;

    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::hash;
    use sui::bag::{Self, Bag};
    use sui::table_vec::{Self, TableVec};
    use sui::dynamic_field as df;

    const EUndefinedPush: u64 = 1;

    const EExistingPush: u64 = 2;

    const EInvalidPushDigestCap: u64 = 3;

    // === Push ===
    struct PUSH has drop {}

    struct Push has key, store {
        id: UID,
        header:PushHeader,
        registered:bool
    }

    struct PushHeader has store, drop {
        hash: vector<u8>,
        push_uri: vector<u8>
    }

    struct RegistryCap has key {
        id:UID
    }

    struct Registry has store {
        pushes: TableVec<Push>,
        bag: Bag
    }

    // fun init(otw: PUSH, ctx: &mut TxContext) {
       
    // }

    //a normal noop push tx.
    public fun push_data(_:vector<u8>) {} 

    //a push containing the header
    //header is [name_length, name, mime_len, mime, encoding_len, encoding, type]
    public fun push_header(header: vector<u8>, ctx: &mut TxContext) : Push {
        iv_push_header(header, ctx)
    }

    //used with bao
    public fun push_outboard(outboard: vector<u8>, ctx: &mut TxContext) {
        //unimplimented
    }


    //internal functions
    fun iv_push_header(header: vector<u8>, ctx: &mut TxContext) : Push {
        iv_new(hash::keccak256(&header), ctx)
    }

    public fun register(reg: &mut Registry, push:Push, header: vector<u8>) {
        iv_register(reg, push)
    }

    fun iv_register(reg: &mut Registry, push:Push, ) {
        let push_id = object::id(&push);
        let idx = table_vec::length(&reg.pushes)+1;
        bag::add(&mut reg.bag, push_id, idx);
        bag::add(&mut reg.bag, push.header.hash, idx);
        bag::add(&mut reg.bag, push.header.push_uri, idx);
        push.registered = true;
        table_vec::push_back(&mut reg.pushes, push)
    }

    fun iv_hash(bytes: &vector<u8>) : vector<u8> {
        hash::keccak256(bytes)
    }

    /// Gets push_uri of `Push`
    public fun borrow_push_header(push: &Push): &PushHeader {
        &push.header
    }

    public fun is_registered(push: &Push): bool {
        push.registered
    }

    public fun is_registered_id(id: &ID, reg: &mut Registry): bool {
        iv_ird(id, reg)
    }

    // internal version of is_registered_id
    fun iv_ird(id: &ID, reg: &mut Registry): bool {
        bag::contains(&reg.bag, *id)
    }

    public fun is_registered_hash(hash: vector<u8>, reg: &mut Registry) : bool {
        iv_irh(hash, reg)
    }

    // internal version of is_registered_hash
    fun iv_irh(hash: vector<u8>, reg: &mut Registry) : bool {
        bag::contains(&reg.bag, hash)
    }

    //internal used by push and push_header
    fun iv_new(hash:vector<u8>, ctx: &mut TxContext): Push {
        let header = PushHeader {
            hash, 
            push_uri: *tx_context::digest(ctx)
        };
        Push { id:object::new(ctx), header, registered:false }
    }
}