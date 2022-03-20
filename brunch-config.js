exports.config = {
  paths: {
    public: './static',
    watched: ['scss']
  },
  files: {
    stylesheets: {
      joinTo: 'style.css'
    }
  },
  plugins: {
    sass: {
      options: {
        includePaths: ['scss']
      }
    }
  }
};