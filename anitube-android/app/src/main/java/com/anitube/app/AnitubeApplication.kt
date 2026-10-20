package com.anitube.app

import android.app.Application
import com.anitube.app.data.local.AnitubeDatabase

class AnitubeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize local Room DB
        AnitubeDatabase.getDatabase(this)
    }
}
