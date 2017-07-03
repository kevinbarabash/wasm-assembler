(module
    (import "console" "print_str" (func $print_str (param i32) (param i32)))
    (import "js" "mem" (memory 1))
    (data (i32.const 0) "Hello, world")
    (func $main
        i32.const 0
        i32.const 13
        call $print_str
    )
)
