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
      get_local $lhs
      get_local $rhs
      i32.add
    else
      get_local $lhs
      get_local $rhs
      i32.sub
    end
  )
  (export "add" (func $add))
  (export "mul" (func $mul))
  (export "add_or_sub" (func $add_or_sub))
)
