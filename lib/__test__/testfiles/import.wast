(module
    (import "console" "log" (func $log (param i32)))
    (import "js" "mem" (memory 1))
    (import "Math" "sin" (func $warn (param f64) (result f64)))
    (func $main
        i32.const 42
        call $log
    )
)
