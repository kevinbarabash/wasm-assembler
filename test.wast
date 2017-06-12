(module
  (import "console" "log" (func $log (param i32)))
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    call $log
    ;; get_local $rhs
    ;; call $log
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
    if i32
      block i32
        get_local $lhs
        get_local $rhs
        i32.add
      end
    else
      block i32
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
    loop i32
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
  (export "add" (func $add))
  (export "mul" (func $mul))
  (export "add_or_sub" (func $add_or_sub))
  (export "print_arr" (func $print_arr))
)
