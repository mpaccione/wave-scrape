# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Specify the latest Node.js version
  buildInputs = [
    pkgs.nodejs_latest
    pkgs.libuuid
  ];

  APPEND_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.libuuid ]}";

  # Optional: specify additional environment variables if needed
  shellHook = ''
      export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
    echo "Welcome to your Node.js development shell!"
    echo "Node.js version: $(node -v)"
  '';
}
