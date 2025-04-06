
updateOne(
    { "name":"John" },
    {$set:{"subjects.$[subject].grade":99}},
    {arrayFilters:[ {"subject.name":"English"}]
    }
)

{"spec.name": "OS","spec.value":os}