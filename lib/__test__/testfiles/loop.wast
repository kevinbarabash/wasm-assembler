(module
    (import "console" "log" (func $log (param i32)))
    (func $print_array
        (param $array i32) (param $length i32)
        (local $index i32)
        i32.const 0
        set_local $index
        loop (result i32)
            get_local $index
            call $log
            get_local $index
            i32.const 1
            i32.add
            tee_local $index
            i32.const 10
            i32.ne
            br_if 0
            get_local $index
        end
        call $log
    )
)