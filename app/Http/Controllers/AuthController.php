<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        // middleware authentication is handled in routes or bootstrap
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {
        $credentials = request(['email', 'password']);
        $recaptchaToken = request('recaptcha_token');

        // Verify ReCaptcha
        if (!$recaptchaToken) {
             return response()->json(['error' => 'Please complete the ReCaptcha.'], 422);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(5)->asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => env('RECAPTCHA_SECRET_KEY'),
                'response' => $recaptchaToken,
            ]);

            if (!$response->successful() || !$response->json()['success']) {
                 return response()->json(['error' => 'ReCaptcha verification failed.'], 422);
            }
        } catch (\Exception $e) {
            // Log the error for admin
            \Illuminate\Support\Facades\Log::error('ReCaptcha Connection Error: ' . $e->getMessage());
            // Return user friendly message
            return response()->json(['error' => 'Gagal terhubung ke Google ReCaptcha. Mohon coba lagi atau hubungi admin.'], 422);
        }

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Login gagal. Periksa email dan password.'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:dosen,mahasiswa,reviewer',
            'identity_number' => 'nullable|string', // NIDN or NPM
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'jacket_size' => 'nullable|string|in:S,M,L,XL,XXL,XXXL',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => $validated['role'],
            ]);

            // Assign Spatie Role
            $user->assignRole($validated['role']);

            // Create Profile based on Role
            if ($validated['role'] === 'mahasiswa') {
                $user->mahasiswaProfile()->create([
                    'npm' => $validated['identity_number'] ?? null,
                    'prodi' => $validated['prodi'] ?? null,
                    'fakultas' => $validated['fakultas'] ?? null,
                    'jacket_size' => $validated['jacket_size'] ?? null,
                ]);
            } else {
                // Dosen & Reviewer use DosenProfile
                $user->dosenProfile()->create([
                    'nidn' => $validated['identity_number'] ?? null,
                    'prodi' => $validated['prodi'] ?? null,
                    'fakultas' => $validated['fakultas'] ?? null,
                ]);
            }

            $token = auth('api')->login($user);

            \Illuminate\Support\Facades\DB::commit();

            return $this->respondWithToken($token);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth('api')->user()->load(['mahasiswaProfile', 'dosenProfile'])); 
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => auth('api')->user()
        ]);
    }
}
