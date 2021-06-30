{
  "targets": [{
    "target_name": "battlesnake",
    "cflags!": ["-fno-exceptions"],
    "cflags_cc!": ["-fno-exceptions"],
    "sources": [
      "native/main.cc",
      "native/battlesnake/state.cc",
      "native/battlesnake/nstate.cc",
    ],
    'include_dirs': [
      "<!@(node -p \"require('node-addon-api').include\")"
    ],
    'libraries': [],
    'dependencies': [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS']
  }]
}