(module
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    get_local $rhs
    i32.add
  )
  (func $add_or_sub (param $lhs i32) (param $rhs i32) (param $op i32) (result i32)
    get_local $op
    i32.eqz
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
  (export "add_or_sub" (func $add_or_sub))
)

