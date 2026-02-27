# ==============================================================================
# CMakeLists.txt — Quantum Orbital Physics WASM Module (C++23)
# ==============================================================================
#
# This CMake configuration builds the orbital physics simulation as a
# WebAssembly module using the Emscripten compiler toolchain.
#
# Build instructions:
#   mkdir build && cd build
#   emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
#   emmake make
#
# Output: orbital.js + orbital.wasm in the build directory
# ==============================================================================

cmake_minimum_required(VERSION 3.20)
project(orbital_wasm LANGUAGES CXX)

# Use C++23 standard for modern language features:
#   - std::ranges for iteration
#   - constexpr enhancements
#   - structured bindings
#   - auto function parameters (abbreviated templates)
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Define the output directory so the .js/.wasm files land in public/wasm/cpp/
set(OUTPUT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../public/wasm/cpp")

# Create the WASM executable from our single source file
add_executable(orbital src/orbital.cpp)

# Set the output name and directory
set_target_properties(orbital PROPERTIES
    OUTPUT_NAME "orbital"
    RUNTIME_OUTPUT_DIRECTORY "${OUTPUT_DIR}"
    SUFFIX ".js"
)

# ==============================================================================
# Emscripten-specific linker flags
# ==============================================================================
#
# -O3                    : Maximum optimization for performance-critical physics code
# EXPORTED_FUNCTIONS     : C functions callable from JavaScript
#   _generate_orbital    : Main entry point — generates particle positions + colors
#   _benchmark_generation: Benchmarking wrapper that returns elapsed time in ms
#   _free_buffer         : Frees malloc'd output buffers from JS side
#   _malloc / _free      : Allow JS to manage WASM heap memory directly
# EXPORTED_RUNTIME_METHODS: JS helper methods for calling C functions
#   ccall                : Call a C function with type conversion
#   cwrap                : Create a reusable JS wrapper for a C function
# MODULARIZE=1           : Wrap output in a factory function (avoids global pollution)
# ALLOW_MEMORY_GROWTH=1  : Let the WASM heap grow dynamically as needed
# EXPORT_ES6=1           : Emit an ES6 module for modern JS bundlers
# ==============================================================================

target_link_options(orbital PRIVATE
    -O3
    "SHELL:-s EXPORTED_FUNCTIONS=['_generate_orbital','_benchmark_generation','_free_buffer','_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s ENVIRONMENT='web'"
)

# Compile with maximum optimization
target_compile_options(orbital PRIVATE -O3)
