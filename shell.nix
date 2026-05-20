# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.libuuid
    pkgs.nodejs_20
    pkgs.python3
    pkgs.pkg-config
    pkgs.cairo
    pkgs.pango
    pkgs.glib
    pkgs.gdk-pixbuf
    pkgs.libjpeg
    pkgs.gifsicle
  ];

  APPEND_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.libuuid ]}";

  shellHook = ''
      export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
    echo "Welcome to your Node.js development shell!"
    echo "Node.js version: $(node -v)"
  '';
}
