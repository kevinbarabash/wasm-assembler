(module
    (func $add (param $lhs i32) (param $rhs i32) (result i32)
        get_local $lhs
        get_local $rhs
        i32.add
    )
    (func $add10 (param $x i32) (result i32) (local $ten i32)
        i32.const 10
        set_local $ten
        get_local $x
        get_local $ten
        i32.add
    )
    (func $getNum (result i32)
        i32.const 42
    )
)
