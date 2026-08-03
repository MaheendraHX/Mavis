package com.maheendra.mavis

import android.content.Intent
import android.net.Uri
import android.os.BatteryManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.BatteryChargingFull
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Memory
import androidx.compose.material.icons.rounded.Send
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.getSystemService

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MavisTheme {
                MavisApp()
            }
        }
    }
}

data class ChatMessage(
    val author: String,
    val body: String,
    val isUser: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MavisApp() {
    val context = LocalContext.current
    val batteryManager = context.getSystemService<BatteryManager>()
    val batteryPercent = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
    val messages = remember {
        mutableStateListOf(
            ChatMessage("MAVIS", "I'm here. Voice is parked for now, so we start with typed commands and phone context.", false),
            ChatMessage("MAVIS", "First build: chat, memory notes, battery status, calendar shortcut, and app launching.", false)
        )
    }
    var draft by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("MAVIS", fontWeight = FontWeight.Bold)
                        Text("Mobile companion", style = MaterialTheme.typography.labelMedium)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .imePadding()
                .navigationBarsPadding()
        ) {
            StatusStrip(
                batteryText = if (batteryPercent >= 0) "$batteryPercent%" else "Unknown",
                onOpenCalendar = {
                    context.startActivity(Intent(Intent.ACTION_VIEW).setData(Uri.parse("content://com.android.calendar/time")))
                }
            )

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { message ->
                    MessageBubble(message)
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = draft,
                    onValueChange = { draft = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Message MAVIS") },
                    shape = RoundedCornerShape(8.dp),
                    maxLines = 4
                )
                Spacer(Modifier.size(8.dp))
                IconButton(
                    onClick = {
                        val text = draft.trim()
                        if (text.isNotEmpty()) {
                            messages.add(ChatMessage("You", text, true))
                            messages.add(ChatMessage("MAVIS", localReply(text, batteryPercent), false))
                            draft = ""
                        }
                    },
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.Rounded.Send, contentDescription = "Send", tint = MaterialTheme.colorScheme.onPrimary)
                }
            }
        }
    }
}

@Composable
fun StatusStrip(
    batteryText: String,
    onOpenCalendar: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatusCard(
            icon = { Icon(Icons.Rounded.BatteryChargingFull, contentDescription = null) },
            title = "Battery",
            value = batteryText,
            modifier = Modifier.weight(1f)
        )
        Button(onClick = onOpenCalendar, shape = RoundedCornerShape(8.dp)) {
            Icon(Icons.Rounded.CalendarMonth, contentDescription = null)
            Spacer(Modifier.size(6.dp))
            Text("Calendar")
        }
    }
}

@Composable
fun StatusCard(
    icon: @Composable () -> Unit,
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.height(48.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            icon()
            Column {
                Text(title, style = MaterialTheme.typography.labelSmall)
                Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (message.isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.fillMaxWidth(0.86f)
        ) {
            Column(Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (!message.isUser) {
                        Icon(Icons.Rounded.Memory, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.size(6.dp))
                    }
                    Text(
                        message.author,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (message.isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(Modifier.size(4.dp))
                Text(
                    message.body,
                    color = if (message.isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

fun localReply(input: String, batteryPercent: Int): String {
    val lower = input.lowercase()
    return when {
        "battery" in lower -> {
            if (batteryPercent >= 0) "Your phone is at $batteryPercent%. Native phone context is online."
            else "I couldn't read battery status on this device yet."
        }
        "remember" in lower -> "Memory is the next real module. For this scaffold, I can mark that request and we will wire storage next."
        "calendar" in lower -> "Calendar integration is next after permissions. For now, use the Calendar button to jump there."
        else -> "Got it. This first Android build is local-only; next we connect it to the MAVIS backend."
    }
}

@Composable
fun MavisTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = androidx.compose.material3.lightColorScheme(
            primary = Color(0xFF1E6F5C),
            onPrimary = Color.White,
            secondary = Color(0xFF425E91),
            background = Color(0xFFFAFBF8),
            surface = Color(0xFFFFFFFF),
            surfaceVariant = Color(0xFFE7EFEA),
            onSurfaceVariant = Color(0xFF23302B)
        ),
        content = content
    )
}
