# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Specify the latest Node.js version
  buildInputs = [
    pkgs.nodejs_latest
  ];

  # Optional: include some common web development tools
  # buildInputs = [
  #   pkgs.nodejs_latest
  #   pkgs.yarn
  #   pkgs.git
  # ];

  # Optional: specify additional environment variables if needed
  shellHook = ''
    echo "Welcome to your Node.js development shell!"
    echo "Node.js version: $(node -v)"
  '';
}
