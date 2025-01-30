class Mainthread {
    public static void main(String[] args) {
        ThreadA t0 = new ThreadA();  // Create a ThreadA object
        t0.start();  // Start the thread, which runs the `run` method
    }
}
