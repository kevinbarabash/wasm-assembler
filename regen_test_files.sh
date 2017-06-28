for i in lib/__test__/testfiles/*.wast; do
    [[ -d "$i" ]] && continue # skip directories
    ../wabt/bin/wast2wasm $i -o ${i/%.wast}.wasm;
done
