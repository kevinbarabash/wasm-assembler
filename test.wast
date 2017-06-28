(module
  (import "console" "log" (func $log (param i32)))
  (import "console" "print_str" (func $print_str (param i32) (param i32)))
  (import "js" "mem" (memory 1))
  (data (i32.const 0) "Hello, world!")
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    get_local $rhs
    i32.add
  )
  (func $mul (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    get_local $rhs
    i32.mul
  )
  (func $add_or_sub
    (param $lhs i32) (param $rhs i32) (param $op i32)
    (result i32)
    (local $zero i32)
    i32.const 0
    set_local $zero
    get_local $op
    get_local $zero
    i32.eq
    if (result i32)
      block (result i32)
        get_local $lhs
        get_local $rhs
        i32.add
      end
    else
      block (result i32)
        get_local $lhs
        get_local $rhs
        i32.sub
      end
    end
  )
  (func $print_arr
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
  (func $main
    i32.const 0
    i32.const 13
    call $print_str
  )
  (start $main)
  (export "add" (func $add))
  (export "mul" (func $mul))
  (export "add_or_sub" (func $add_or_sub))
  (export "print_arr" (func $print_arr))
)
