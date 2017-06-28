(module
    (func $is_zero (param $arg i32) (result i32)
        get_local $arg
        i32.const 0
        i32.eq
        if (result i32)
            i32.const 1
        else
            i32.const 0
        end
    )
)
