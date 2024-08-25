import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@rneui/themed'
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        webClientId: '857071329977-najs58ba0qqkb9t9lkf7h27t571lfi2k.apps.googleusercontent.com',
    })

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (
        <View style={styles.container}>
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={async () => {
                    try {
                        await GoogleSignin.hasPlayServices()
                        const userInfo = await GoogleSignin.signIn()
                        if (userInfo.idToken) {
                            const { data, error } = await supabase.auth.signInWithIdToken({
                                provider: 'google',
                                token: userInfo.idToken,
                            })
                            console.log(error, data)
                        } else {
                            throw new Error('no ID token present!')
                        }
                    } catch (error: any) {
                        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                            // user cancelled the login flow
                            alert('SIGN_IN_CANCELLED')
                        } else if (error.code === statusCodes.IN_PROGRESS) {
                            // operation (e.g. sign in) is in progress already
                            alert('IN_PROGRESS')
                        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                            // play services not available or outdated
                            alert('PLAY_SERVICES_NOT_AVAILABLE')
                        } else {
                            // some other error happened
                            console.log(error)
                        }
                    }
                }}
            />
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
            </View>
            <View style={styles.verticallySpaced}>
                <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})